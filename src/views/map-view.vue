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
    <label>
      <input type="checkbox" v-model="showDebug" />
      Show debugging Grid
    </label>
  </div>

  <renderer-viewer
    :game="game"
    :debugGrid="showDebug"
  />
</template>

<script src="./map-view.ts"></script>

<style scoped>
.mulit-row{
    font-family:"Courier New", Courier, monospace
}
</style>
