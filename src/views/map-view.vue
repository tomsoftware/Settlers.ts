<template>
  <div class="about">
    Map File:
    <file-browser
      :fileManager="fileManager"
      @select="onFileSelect"
      filter=".map"
      class="browser"
    />

    <pre class="fullsize">{{mapInfo}}</pre>
  </div>

  <renderer-view :game="game"/>
</template>

<script src="./map-view.ts"></script>

<style scoped>
.mulit-row{
    font-family:"Courier New", Courier, monospace
}
</style>
