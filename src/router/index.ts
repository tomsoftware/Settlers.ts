import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '@/views/home.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/map-view',
    name: 'MapView',
    component: () => import('@/views/map-view.vue')
  },
  {
    path: '/lib-view',
    name: 'LibView',
    component: () => import('@/views/lib-view.vue')
  },
  {
    path: '/gh-view',
    name: 'GhView',
    component: () => import('@/views/gh-view.vue')
  },
  {
    path: '/gfx-view',
    name: 'GfxView',
    component: () => import('@/views/gfx-view.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
