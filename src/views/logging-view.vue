<template>

  <table class="loging">
    <tr>
      <th>Source:</th>
      <th>Message:</th>
    </tr>
    <tr
      v-for="msg of logs"
      :key="msg.index"
      :class="'logType' + msg.type"
    >
      <td>{{msg.source}}</td>
      <td>{{msg.msg}}</td>
    </tr>
  </table>

</template>

<script src="./logging-view.ts"></script>

<style scoped>
.loging {
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  padding-top: 20px;
  text-align: left;
  overflow: scroll;
  display: block;
}

.logType0 {
  color: red;
}

.logType1 {
  color: gray;
}

</style>
