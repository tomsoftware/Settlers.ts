<template>
  <div class="about">
    Gfx File:
    <file-browser
      @select="onFileSelect"
      filter=".gfx"
      class="browser"
    />

    <br />
    Items:
    <select
      class="mulit-row fullsize"
      v-model="selectedItem"
      @change="onSelectItem"
    >
      <option v-for="item of gfxContent" :key="item.dataOffset" :value="item">
        {{pad(item.dataOffset, 10)}} Size: {{pad(item.height + ' x ' + item.width, 12)}}
      </option>
    </select>

    <br />

    <template v-if="selectedItem!=null">
      <pre class="fullsize">{{selectedItem.toString()}}</pre>
      <br />
    </template>

    Image:<br />
    <canvas height="800" width="800" ref="ghCav" class="1PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </div>
</template>

<script src="./gfx-view.ts"></script>

<style scoped>
.mulit-row{
    font-family:"Courier New", Courier, monospace
}
</style>
