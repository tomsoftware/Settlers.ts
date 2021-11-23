<template>
  <select @change="selectFile" v-model="selectedFile">
    <option v-for="file of files" :key="file.path" :value="file">
      {{file.path}}
    </option>
  </select>
</template>

<script src="./file-browser.ts"></script>
