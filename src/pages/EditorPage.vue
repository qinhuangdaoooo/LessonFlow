<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 编辑器头部 -->
    <div class="bg-white border-b border-gray-200 px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link
            to="/"
            class="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <el-icon :size="20">
              <ArrowLeft />
            </el-icon>
            <span>返回首页</span>
          </router-link>
          <div class="h-6 w-px bg-gray-300" />
          <h1 class="text-xl font-semibold text-gray-900">教材编辑器</h1>
        </div>
        <div class="flex items-center space-x-3">
          <el-button link @click="handlePreview">
            <el-icon :size="16">
              <View />
            </el-icon>
            <span>预览</span>
          </el-button>
          <el-button link @click="handleExport">
            <el-icon :size="16">
              <Download />
            </el-icon>
            <span>导出</span>
          </el-button>
          <el-button type="primary" @click="handleSave">
            <el-icon :size="16">
              <Select />
            </el-icon>
            <span>保存</span>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 编辑器主体 -->
    <div class="flex h-[calc(100vh-73px)]">
      <!-- 侧边栏 -->
      <div class="w-64 bg-white border-r border-gray-200 p-4">
        <h3 class="text-sm font-medium text-gray-900 mb-4">组件库</h3>
        <div class="space-y-2">
          <div
            v-for="component in components"
            :key="component.name"
            class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <div class="text-sm font-medium text-gray-900">
              {{ component.name }}
            </div>
            <div class="text-xs text-gray-500">{{ component.description }}</div>
          </div>
        </div>
      </div>

      <!-- 编辑区域 -->
      <div class="flex-1 flex flex-col">
        <div class="flex-1 p-6">
          <div class="max-w-4xl mx-auto">
            <div class="bg-white rounded-lg border border-gray-200 min-h-[500px] p-6">
              <el-input
                v-model="content"
                type="textarea"
                :rows="20"
                placeholder="开始编写你的教材内容..."
                class="w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 属性面板 -->
      <div class="w-64 bg-white border-l border-gray-200 p-4">
        <h3 class="text-sm font-medium text-gray-900 mb-4">属性设置</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >标题</label
            >
            <el-input v-model="formData.title" placeholder="输入标题" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >描述</label
            >
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="3"
              placeholder="输入描述"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2"
              >标签</label
            >
            <el-input
              v-model="formData.tags"
              placeholder="输入标签，用逗号分隔"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  ArrowLeft,
  View,
  Download,
  Select,
} from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

const content = ref('');

const formData = ref({
  title: '',
  description: '',
  tags: '',
});

const components = [
  {
    name: '文本段落',
    description: '添加文本内容',
  },
  {
    name: '图片',
    description: '插入图片',
  },
  {
    name: '代码块',
    description: '代码示例',
  },
  {
    name: '表格',
    description: '数据表格',
  },
];

const handlePreview = () => {
  ElMessage.info('预览功能开发中...');
};

const handleExport = () => {
  ElMessage.info('导出功能开发中...');
};

const handleSave = () => {
  ElMessage.success('保存成功！');
};
</script>

<style scoped>
:deep(.el-textarea__inner) {
  border: none;
  outline: none;
  box-shadow: none;
  resize: none;
}

:deep(.el-input__wrapper) {
  border-radius: 0.5rem;
}
</style>

