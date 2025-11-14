<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
    <!-- 鼠标跟随效果 -->
    <div
      class="fixed top-0 left-0 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl pointer-events-none z-0 transition-all duration-300"
      :style="{ transform: `translate(${mouseX - 192}px, ${mouseY - 192}px)` }"
    />

    <!-- 主要内容 -->
    <div class="relative z-10">
      <!-- 导航栏 -->
      <nav class="flex items-center justify-between p-6">
        <div class="flex items-center space-x-2">
          <el-icon :size="32" color="#2563eb">
            <Document />
          </el-icon>
          <span class="text-2xl font-bold text-gray-900">LessonFlow</span>
        </div>
        <div class="flex items-center space-x-4">
          <a
            href="https://github.com/your-username/lesson-flow"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
          <router-link
            to="/editor"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            开始编辑
          </router-link>
        </div>
      </nav>

      <!-- 英雄区域 -->
      <div class="text-center py-20 px-6">
        <Transition name="fade-up" appear>
          <div v-if="isMounted">
            <h1 class="text-6xl md:text-7xl font-bold text-gray-900 mb-6">
              教材编辑器
            </h1>
            <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              现代化的教材编辑工具，让教学内容创作变得简单高效
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <router-link
                to="/editor"
                class="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                立即开始
              </router-link>
              <button
                class="px-8 py-4 border border-gray-300 text-gray-700 text-lg rounded-lg hover:bg-gray-50 transition-colors"
              >
                查看演示
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- 功能特性 -->
      <div class="py-20 px-6">
        <div class="max-w-6xl mx-auto">
          <h2 class="text-4xl font-bold text-center text-gray-900 mb-16">
            强大的功能特性
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <TransitionGroup name="fade-up-stagger">
              <div
                v-for="(feature, index) in features"
                :key="index"
                :style="{ transitionDelay: `${index * 100}ms` }"
                class="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div class="text-blue-600 mb-4">
                  <component :is="feature.icon" class="w-6 h-6" />
                </div>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  {{ feature.title }}
                </h3>
                <p class="text-gray-600">{{ feature.description }}</p>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <!-- 页脚 -->
      <footer class="py-12 px-6 border-t border-gray-200">
        <div class="max-w-6xl mx-auto text-center">
          <p class="text-gray-600">
            © 2024 LessonFlow. 让教育内容创作更简单.
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Document, Edit, Grid, MagicStick, Brush } from '@element-plus/icons-vue';

const isLoggedIn = ref(false);
const isMounted = ref(false);
const mouseX = ref(0);
const mouseY = ref(0);

const features = [
  {
    icon: Edit,
    title: '可视化编辑',
    description: '拖拽式界面，所见即所得',
  },
  {
    icon: Grid,
    title: '模块化设计',
    description: '组件化架构，易于维护',
  },
  {
    icon: MagicStick,
    title: '智能推荐',
    description: 'AI 驱动的教学内容推荐',
  },
  {
    icon: Brush,
    title: '代码高亮',
    description: '支持多种编程语言',
  },
];

const handleMouseMove = (e: MouseEvent) => {
  mouseX.value = e.clientX;
  mouseY.value = e.clientY;
};

onMounted(() => {
  isLoggedIn.value = false;
  window.addEventListener('mousemove', handleMouseMove);
  
  // 延迟设置 mounted 状态，让动画更平滑
  setTimeout(() => {
    isMounted.value = true;
  }, 100);
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>

<style scoped>
.fade-up-enter-active {
  transition: all 0.8s ease;
}

.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.fade-up-stagger-enter-active {
  transition: all 0.8s ease;
}

.fade-up-stagger-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-up-stagger-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>

