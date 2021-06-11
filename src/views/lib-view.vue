<template>
  <div class="about">
    Lib File:
    <file-browser
      @select="onFileSelect"
      filter=".lib"
      class="browser"
    />

    <br />
    Items:
    <select
      class="mulit-row fullsize"
      v-model="selectedItem"
      @change="onSelectItem"
    >
      <option v-for="item of libContent" :key="item.fileName" :value="item">
        {{pad(item.getFullName(), 50)}} Size: {{pad(item.decompressedLength, 6)}}
      </option>
    </select>

    <template v-if="selectedItem!=null">

      <pre class="fullsize">{{selectedItem.toString()}}</pre>

      Checksum Check: {{selectedItem.checkChecksum()}}
      <br />

      Show Content: <hex-viewer
        :value="selectedItem.getReader()"
      />
    </template>

  </div>
</template>

<script src="./lib-view.ts"></script>

<style scoped>
.mulit-row{
    font-family:"Courier New", Courier, monospace
}
</style>
