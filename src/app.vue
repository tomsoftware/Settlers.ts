<template>
  <div id="nav">
    <router-link to="/">Start</router-link> |
    <router-link to="/map-view">Map View</router-link> |
    <router-link to="/map-file-view">Map File View</router-link> |
    <router-link to="/lib-view">Lib View</router-link> |
    <router-link to="/gh-view">Gh View</router-link> |
    <router-link to="/gfx-view">Gfx View</router-link> |
    <router-link to="/jil-view">Jil View</router-link> |
    <router-link to="/logging-view">Logging</router-link>
  </div>

  <router-view :fileManager="fileManager" />

</template>

<script src="./app.ts"></script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

</style>
