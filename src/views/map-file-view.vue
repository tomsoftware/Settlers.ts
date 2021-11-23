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

    <select class="mulit-row fullsize" v-model="selectedChunk">
      <option v-for="chunk of mapChunks" :key="chunk.offset" :value="chunk">
        Type: {{pad(chunk.chunkTypeAsString + ' - ' + chunk.chunkType, 35)}} Size: {{pad(chunk.length, 6)}}
      </option>
    </select>

    <pre class="fullsize" v-if="selectedChunk!=null">{{selectedChunk.toString()}}</pre>

    <hex-viewer
      v-if="selectedChunk && mapContent"
      :value="selectedChunk.getReader()"
      :width="mapContent.mapSize.width"
      :height="mapContent.mapSize.height"
    />

  </div>
</template>

<script src="./map-file-view.ts"></script>

<style scoped>
.mulit-row{
    font-family:"Courier New", Courier, monospace
}
</style>
