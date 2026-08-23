<Frame name="HERO" w={1440} h={900} bg="#0a0d12" flex="col" justify="between">

  <Frame name="chrome-top" w="fill" h="hug" flex="row" justify="between" items="start" pt={24} pl={32} pr={32}>
    <Frame name="readout-tl" w={320} h="hug" flex="col" gap={6}>
      <Frame w="fill" h="hug" flex="row" gap={16}>
        <Text w={72} size={11} font="IBM Plex Mono" color="#848e9c">SUN</Text>
        <Text w={64} size={11} font="IBM Plex Mono" color="#f0ce72">-4.2°</Text>
        <Text w={160} size={11} font="IBM Plex Mono" color="#848e9c">CIVIL TWILIGHT</Text>
      </Frame>
      <Frame w="fill" h="hug" flex="row" gap={16}>
        <Text w={72} size={11} font="IBM Plex Mono" color="#848e9c">MOON</Text>
        <Text w={64} size={11} font="IBM Plex Mono" color="#bfc6d0">62%</Text>
        <Text w={160} size={11} font="IBM Plex Mono" color="#848e9c">WAXING GIBBOUS</Text>
      </Frame>
      <Frame w="fill" h="hug" flex="row" gap={16}>
        <Text w={72} size={11} font="IBM Plex Mono" color="#848e9c">OBSERVER</Text>
        <Text w={224} size={11} font="IBM Plex Mono" color="#bfc6d0">12.97°N 77.59°E</Text>
      </Frame>
    </Frame>

    <Frame name="view-toggle" w="hug" h="hug" flex="row">
      <Frame w={72} h={22} bg="#7fa8f5" justify="center" items="center">
        <Text size={11} font="IBM Plex Mono" color="#0a0d12">HUMAN</Text>
      </Frame>
      <Frame w={72} h={22} bg="#0a0d12" stroke="#242a33" strokeWidth={1} justify="center" items="center">
        <Text size={11} font="IBM Plex Mono" color="#848e9c">MACHINE</Text>
      </Frame>
    </Frame>
  </Frame>

  <Frame name="hero-content" w="fill" h="hug" flex="col" gap={24} pl={192} pr={192}>
    <Text w={1056} size={112} font="Archivo Black" color="#edebe6">ADRIJ</Text>
    <Text w={1056} size={112} font="Archivo Black" color="#edebe6">SHIKHAR</Text>
    <Frame name="accent-rule" w={320} h={2} bg="#7fa8f5" />
    <Text w={1056} size={11} font="IBM Plex Mono" color="#7fa8f5">SENIOR SOFTWARE ENGINEER  ·  HEVO DATA  ·  BANGALORE</Text>
    <Text w={608} size={17} font="Archivo" color="#bfc6d0">I move data between systems that were never designed to agree, and write down what breaks on the way.</Text>
  </Frame>

  <Frame name="metrics" w="fill" h="hug" flex="row" gap={96} pl={192} pr={192} pb={48} pt={48}>
    <Frame w="hug" h="hug" flex="col" gap={8}>
      <Text w={200} size={11} font="IBM Plex Mono" color="#eda05b">4 YEARS SHIPPING</Text>
    </Frame>
    <Frame w="hug" h="hug" flex="col" gap={8}>
      <Text w={200} size={11} font="IBM Plex Mono" color="#eda05b">25K OBJECTS SYNCED</Text>
    </Frame>
    <Frame w="hug" h="hug" flex="col" gap={8}>
      <Text w={200} size={11} font="IBM Plex Mono" color="#eda05b">200 P0/P1 TRIAGED</Text>
    </Frame>
  </Frame>

</Frame>
