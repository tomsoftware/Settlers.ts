<template>
  <div class="optionSelect">
    <input type="radio" id="none" value="" v-model="type">
    <label for="none">none</label>

    <input type="radio" id="text" value="text" v-model="type">
    <label for="text">text</label>

    <input type="radio" id="hex" value="hex" v-model="type">
    <label for="hex">hex</label>

    <template v-if="width">
      <input type="radio" id="img" value="img" v-model="type">
      <label for="img">image</label>
    </template>

    <button @click="onSaveFile()">save</button>
  </div>

  <br />

  <template v-if="type!=='img'">
    <pre class="content">{{content}}</pre>

    <a href="#" v-if="isTrimmed" @click="showAll">show all</a>
  </template>

 <div v-show="type==='img'">
    <label>Bytes per Pixle:
      <input type="number" v-model.number="bytePerPixel" @change="updateContent" />
    </label>

    <label> Byte offset:
      <input type="number" v-model.number="byteOffset" @change="updateContent" />
    </label>

    <label> Width:
      <input type="number" v-model.number="useWidth" @change="updateContent" />
    </label>

    <br />
    {{imagePointInfo}}
    <br />

    <canvas
      height="800"
      width="800"
      ref="cav"
      class="cav"
      @mousemove="onMouseMove"
    />
  </div>

</template>

<script src="./hex-viewer.ts"></script>

<style scoped>

.content{
  font-family:"Courier New", Courier, monospace;
  text-align: left;
  white-space: pre-wrap;
}

.cav {
  margin: 3px;
  border: 1px solid red;
}

.optionSelect input, .optionSelect button {
  margin-left: 10px;
}

</style>
