---
# dev.to draft — retry-thread-pool
# Publish via: POST/PUT https://dev.to/api/articles  (header: api-key: $DEV_TO_API_KEY)
# Keep published:false until the author reviews it in the dev.to dashboard.
# NOTE: dev.to renders single newlines as <br>. Keep every paragraph/bullet on ONE line.
title: "retry-thread-pool: a retrying executor for Java"
published: false
canonical_url: "https://adrijshikhar.dev/blogs/retry-thread-pool"
tags: java, opensource, webdev, ai
description: "Retries at the thread-pool level for Java 17+ — submit named tasks, get CompletableFutures, and let backoff/predicates/timeouts run on their own. Zero runtime dependencies, built agent-first."
---

> Originally published at [adrijshikhar.dev](https://adrijshikhar.dev/blogs/retry-thread-pool).

Most retry libraries wrap **one call**. Fine for a single flaky operation — but when you run a *pool* of tasks, retry should be the pool's job, not yours.

[`retry-thread-pool`](https://github.com/adrijshikhar/retry-thread-pool) puts retries at the thread-pool level: wrap any `ExecutorService`, submit a named task, get a `CompletableFuture` — retries happen on their own. Java 17+, on Maven Central, **zero runtime dependencies**.

## Quickstart

```java
RetryPolicy policy = RetryPolicy.builder()
    .maxRetries(3)
    .backoff(Backoff.exponentialWithJitter(Duration.ofMillis(100), Duration.ofSeconds(5)))
    .retryOn(IOException.class)
    .build();

try (RetryExecutor executor = RetryExecutor.builder().retryPolicy(policy).build()) {
    CompletableFuture<User> user = executor.submit("fetch-user", () -> client.fetchUser(id));
    // compose it, join it, or collect a whole batch — it's a normal CompletableFuture
}
```

## What you get

- **Backoff** — `none`, `fixed`, `exponential`, `exponentialWithJitter`. Jitter kills synchronized retry storms.
- **Predicates** — `retryOn(...)` / `abortOn(...)`; `abortOn` wins. `Error` and `InterruptedException` never retry.
- **Per-attempt timeout** — a hung attempt is interrupted and retried, not left to wedge a worker.
- **Listeners** — `onRetry` / `onSuccess` / `onExhausted` / `onAbort`, for metrics/logs without touching task code.
- **Stats** — immutable snapshot: submitted / succeeded / exhausted / retried / timed-out counts.
- **Bring your own pool** — any `ExecutorService`, including virtual threads on 21+.
- **Loud exhaustion** — out of retries → `RetryExhaustedException` (cause = last failure); a non-retryable error surfaces as itself.

## Why it matters

- **Fire and forget** — submit → future. No catch, no `sleep`, no attempt counters, no rescheduling in your code.
- **Async stays async** — backoff is a scheduler timer, not a `Thread.sleep`. Workers keep working; throughput holds when a dependency flaps.
- **Independent healing** — each task has its own budget; one flaky task doesn't stall the ninety-nine beside it.
- **Resilience is a pool property** — not retry logic threaded through every call site.

## Observability

See what the pool is doing — without instrumenting your task code:

- **Listeners** — `onRetry` / `onSuccess` / `onExhausted` / `onAbort` fire on every transition; bridge them to Micrometer, StatsD, or logs.
- **`stats()`** — an immutable snapshot: submitted / succeeded / exhausted / aborted / retried / timed-out / rejected, plus active + queued counts. Scrape it for a dashboard or a health check.
- **Logs** — via `System.Logger`, routed to your existing backend. Nothing to wire.
- **Latency** — `TaskEvent.attemptDuration` (per attempt) and `stats().totalExecutionMillis` (aggregate) give you timing, not just counts.

```java
RetryExecutor executor = RetryExecutor.builder()
    .retryPolicy(policy)
    .listener(new RetryListener() {
        @Override public void onRetry(TaskEvent e)     { meter.counter("pool.retry", "task", e.taskName()).increment(); }
        @Override public void onExhausted(TaskEvent e) { meter.counter("pool.exhausted", "task", e.taskName()).increment(); }
    })
    .build();

RetryExecutorStats s = executor.stats();   // point-in-time snapshot
log.info("succeeded={} exhausted={} retries={} timedOut={}",
        s.succeeded(), s.exhausted(), s.retriesScheduled(), s.timedOut());
```

## Lifecycle & control

- **`AutoCloseable`** — use try-with-resources; `close()` stops new submits and drains in-flight plus already-scheduled retries before returning.
- **Owns only what it makes** — it shuts down its internal pool; a pool you pass in stays yours to close.
- **Cancellation** — `future.cancel(true)` interrupts the running attempt and cancels the pending retry. Cancelled ≠ exhausted, so no spurious `onExhausted`.

## Robustness

- **Fail-fast config** — the builder validates at `build()`: `maxRetries >= 0`, positive durations, and a class listed in both `retryOn` and `abortOn` is rejected.
- **Overflow-safe backoff** — exponential delays cap cleanly instead of overflowing; jitter is full jitter over `[0, delay]`.
- **Correct under load** — the scheduler thread never runs your code (attempts and listeners run on the work pool), and stats are lock-free.

## One design call: wrap, don't subclass

`RetryExecutor` *wraps* an `ExecutorService` instead of extending `ThreadPoolExecutor`. The retry engine stays independent of how work runs, and the public surface is exactly the retry API — nothing to reach around.

```java
RetryExecutor.builder()
    .executor(Executors.newVirtualThreadPerTaskExecutor())  // you own its lifecycle
    .retryPolicy(RetryPolicy.ofDefaults())
    .build();
```

## Zero dependencies

Logging goes through the JDK's `System.Logger` facade (Java 9+) — routes to your SLF4J/Log4j if present, silent otherwise. You add one artifact and nothing else comes with it.

## Agent-first

Built so an AI agent can use it from the examples alone:

- **`llms.txt`** — discovery index pointing agents at the docs.
- **`docs/AI_USAGE.md`** — full public surface + a recipe per feature.
- **`AGENTS.md`** — build/test/conventions for agents editing the library.
- **Docs = compiling tests** — every recipe is a real test in `ExamplesTest`. Change the API and the examples stop compiling, so the build fails. The docs can't drift from the code.

```java
// from ExamplesTest — compiles and passes on every build
@Test
void exhaustionSurfacesLastFailure() {
  RetryPolicy policy = RetryPolicy.builder()
      .maxRetries(2).backoff(Backoff.fixed(Duration.ofMillis(5))).build();
  try (RetryExecutor executor = RetryExecutor.builder().retryPolicy(policy).build()) {
    CompletableFuture<String> result =
        executor.submit("doomed", () -> { throw new IOException("permanent"); });
    ExecutionException thrown = assertThrows(ExecutionException.class, result::get);
    RetryExhaustedException cause =
        assertInstanceOf(RetryExhaustedException.class, thrown.getCause());
    assertEquals(3, cause.attempts());          // 1 initial + 2 retries
    assertInstanceOf(IOException.class, cause.getCause());
  }
}
```

## Try it

```xml
<dependency>
  <groupId>io.github.adrijshikhar</groupId>
  <artifactId>retry-thread-pool</artifactId>
  <version>0.2.0</version>
</dependency>
```

- **Repo:** https://github.com/adrijshikhar/retry-thread-pool
- **API docs:** https://javadoc.io/doc/io.github.adrijshikhar/retry-thread-pool

Retries belong wherever your work runs. If your work runs on a pool, they belong on the pool.
