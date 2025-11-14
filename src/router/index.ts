import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import HomePage from '@/pages/HomePage.vue';
import EditorPage from '@/pages/EditorPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/editor',
    name: 'Editor',
    component: EditorPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

