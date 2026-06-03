---
# dev.to draft — retry-thread-pool
# Publish via: POST/PUT https://dev.to/api/articles  (header: api-key: $DEV_TO_API_KEY)
# Keep published:false until the author reviews it in the dev.to dashboard.
# NOTE: dev.to renders single newlines as <br>. Keep every paragraph/bullet on ONE line.
title: "retry-thread-pool: a retrying executor for Java"
published: false
canonical_url: "https://adrijshikhar.dev/blogs/retry-thread-pool"
tags: java, opensource, webdev, ai
description: "A Java library that makes retrying a property of the thread pool, not the call site — and is built agent-first so AI agents can use it correctly from the examples alone."
---

> Originally published at [adrijshikhar.dev](https://adrijshikhar.dev/blogs/retry-thread-pool).

Most retry libraries decorate a single call. You wrap a supplier, the wrapper catches a failure, sleeps, and calls it again. That's the right shape when you have one flaky operation. But when you run a *pool* of tasks — a hundred independent fetches, a batch of jobs, a fan-out across workers — retry stops being a property of the call and becomes a property of the pool. You want to hand work to an executor, get a future back, and have the pool quietly re-run whatever failed, with its own backoff and budget, without you threading that logic through every call site.

That's [`retry-thread-pool`](https://github.com/adrijshikhar/retry-thread-pool): a small Java 17+ library that moves retries down to the thread-pool level. It's on Maven Central, has zero runtime dependencies, and — the part I want to dwell on — it's built so an AI agent can pick it up and use it correctly from the examples alone.

## The shape

You wrap any `ExecutorService`, submit a *named* task, and get a `CompletableFuture` back. Retries are transparent — the future only completes when the task finally succeeds or exhausts its budget.

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

The name (`"fetch-user"`) is a label that flows through events, logs, and stats, so when something retries five times at 3am you know *what* did. The policy is immutable and reusable; the executor is `AutoCloseable`.

## What the pool gives you

The point is how much the pool handles for you, so you don't rebuild it per task:

- **Backoff strategies** — `none`, `fixed`, `exponential`, and `exponentialWithJitter`. Jitter matters at pool scale: without it, a hundred tasks that fail together retry together, and you've built a self-inflicted thundering herd.
- **Retry predicates** — `retryOn(...)` / `abortOn(...)` decide which exceptions are worth retrying. `abortOn` wins, so a validation error fails fast while a network blip retries. `Error` and `InterruptedException` are never retried.
- **Per-attempt timeout** — a hung attempt is interrupted and retried instead of wedging a worker forever.
- **Listeners** — `onRetry` / `onSuccess` / `onExhausted` / `onAbort`, for wiring metrics or logs without coupling them into your task code.
- **Stats** — an immutable snapshot of submitted / succeeded / exhausted / retried / timed-out counts.

When retries run out, the future fails with `RetryExhaustedException` whose cause is the last failure. A non-retryable exception surfaces as itself.

## A design choice: wrap, don't subclass

The obvious way to build this in Java is to extend `ThreadPoolExecutor` and override its hooks. I chose composition instead — `RetryExecutor` *wraps* an `ExecutorService` rather than being one.

That keeps the retry engine independent of how work actually runs. You bring the executor: a fixed pool, a cached pool, or a virtual-thread executor on Java 21+. The retry logic lives in one place and never has to fight the executor's lifecycle, and the public surface is exactly the retry API and nothing else.

```java
RetryExecutor.builder()
    .executor(Executors.newVirtualThreadPerTaskExecutor())  // you own its lifecycle
    .retryPolicy(RetryPolicy.ofDefaults())
    .build();
```

## Zero runtime dependencies

A small utility library shouldn't drag transitive baggage into your dependency tree. `retry-thread-pool` has **no runtime dependencies**. Logging goes through the JDK's built-in `System.Logger` facade (Java 9+), so if your app has SLF4J or Log4j on the classpath the library's logs route there automatically; if it doesn't, they're silently discarded.

## Agent-first: the examples *are* the contract

Increasingly the first thing to "read" a library isn't a human — it's an AI agent writing code against it. So the repo is built agent-first.

- **`llms.txt`** at the repo root — a curated index pointing an agent at the usage guide, API reference, and examples instead of making it crawl the whole tree.
- **`docs/AI_USAGE.md`** — one dense file with the complete public surface, failure semantics, and a recipe per feature. An agent retrieves it, grounds on it, and generates correct calls.
- **`AGENTS.md`** — for agents *editing* the library: build/test commands and conventions.

But docs rot. The fix is to make the examples executable: **every recipe in the docs is a real, passing test**. If the public API changes, the examples stop compiling and the build fails — so the snippets an agent copies are guaranteed to match the published API. The documentation can't drift from the code, because the documentation *is* code that CI runs.

```java
// from ExamplesTest — this compiles and passes on every build
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

A human reads `AI_USAGE.md`; an agent retrieves it; the build proves it. Same source, three readers.

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
