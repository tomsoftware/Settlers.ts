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
        path: '/map-file-view',
        name: 'MapFileView',
        component: () => import('@/views/map-file-view.vue')
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
    },
    {
        path: '/jil-view',
        name: 'JilView',
        component: () => import('@/views/jil-view.vue')
    },
    {
        path: '/logging-view',
        name: 'LoggingView',
        component: () => import('@/views/logging-view.vue')
    }
];

const router = createRouter({
    history: createWebHistory(process.env.BASE_URL),
    routes
});

export default router;
