<template>
  <select @change="selectFile" v-model="selectedFile">
    <option v-for="file of files" :key="file.name" :value="file">
      {{file.name}}
    </option>
  </select>
</template>

<script src="./file-browser.ts"></script>
