<template>
  <div class="about">
    Jil File:
    <file-browser
      :fileManager="fileManager"
      @select="onFileSelect"
      filter=".jil"
      class="browser"
    />

    <br />
    Items:
    <select
      class="mulit-row fullsize"
      v-model="selectedJil"
      @change="onSelectJil"
    >
      <option v-for="item of jilList" :key="item.index" :value="item">
        {{pad(item.index, 5)}} Size: {{pad(item.lenght, 4)}}  Offset: {{pad(item.offset, 6)}}
      </option>
    </select>

    <select
      class="mulit-row fullsize"
      v-model="selectedDil"
      @change="onSelectDil"
    >
      <option v-for="item of dilList" :key="item.index" :value="item">
        {{pad(item.index, 5)}} Size: {{pad(item.lenght, 4)}}  Offset: {{pad(item.offset, 6)}}
      </option>
    </select>

    <select
      class="mulit-row fullsize"
      v-model="selectedGil"
      @change="onSelectGil"
    >
      <option v-for="item of gilList" :key="item.index" :value="item">
        {{pad(item.index, 5)}} Size: {{pad(item.lenght, 4)}}  Offset: {{pad(item.offset, 6)}}
      </option>
    </select>
    <br />

    Image:<br />
    <canvas height="800" width="800" ref="ghCav" class="1PixelatedRendering">
      Sorry! Your browser does not support HTML5 Canvas and can not run this Application.
    </canvas>

  </div>
</template>

<script src="./jil-view.ts"></script>

<style scoped>
.mulit-row{
    font-family:"Courier New", Courier, monospace
}
</style>
