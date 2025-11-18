# Vue3 重构实施指南

## 🎯 快速开始

### 第一步：创建新项目

```bash
# 在 packages 目录下创建新项目
cd packages
mkdir editor-vue3
cd editor-vue3

# 使用 Vite 创建 Vue3 + TypeScript 项目
npm create vite@latest . -- --template vue-ts

# 安装依赖
npm install
```

### 第二步：安装核心依赖

```bash
# 编辑器核心
npm install slate slate-react slate-history

# Vue3 相关
npm install @vueuse/core pinia

# UI 框架
npm install element-plus

# 工具库
npm install nanoid lodash-es
npm install -D @types/lodash-es

# 测试框架
npm install -D vitest @vue/test-utils happy-dom
```

### 第三步：配置 TypeScript

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/core/*": ["src/core/*"],
      "@/modules/*": ["src/modules/*"],
      "@/components/*": ["src/components/*"],
      "@/composables/*": ["src/composables/*"],
      "@/stores/*": ["src/stores/*"],
      "@/types/*": ["src/types/*"],
      "@/utils/*": ["src/utils/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 📦 核心代码实现

### 1. 类型定义

```typescript
// src/types/editor.ts
import type { BaseEditor, BaseElement, BaseText } from 'slate'
import type { ReactEditor } from 'slate-react'
import type { HistoryEditor } from 'slate-history'

// 扩展 Slate 类型
export type CustomEditor = BaseEditor & ReactEditor & HistoryEditor

export type CustomElement = BaseElement & {
  type: string
  children: CustomNode[]
  [key: string]: any
}

export type CustomText = BaseText & {
  [key: string]: any
}

export type CustomNode = CustomElement | CustomText

// 编辑器配置
export interface EditorConfig {
  placeholder?: string
  readOnly?: boolean
  mode?: 'default' | 'readonly' | 'edit' | 'revision' | 'approval'
  modules?: string[] // 启用的模块列表
  [key: string]: any
}

// 编辑器实例
export interface EditorInstance {
  getHtml(): string
  setHtml(html: string): Promise<void>
  getJson(): CustomNode[]
  setJson(nodes: CustomNode[]): void
  insertNode(node: CustomNode): void
  deleteNode(path: number[]): void
  focus(): void
  blur(): void
  destroy(): void
  on(event: string, handler: Function): void
  off(event: string, handler: Function): void
  emit(event: string, ...args: any[]): void
}
```

### 2. 模块系统

```typescript
// src/core/modules/ModuleRegistry.ts
import type { EditorModule } from '@/types/modules'
import type { EditorInstance } from '@/types/editor'

export class ModuleRegistry {
  private modules = new Map<string, EditorModule>()
  private editor: EditorInstance | null = null

  /**
   * 注册模块
   */
  register(module: EditorModule): void {
    if (this.modules.has(module.name)) {
      console.warn(`Module ${module.name} is already registered`)
      return
    }

    this.modules.set(module.name, module)

    // 如果编辑器已初始化，执行模块的 onInit 钩子
    if (this.editor && module.onInit) {
      module.onInit(this.editor)
    }
  }

  /**
   * 注销模块
   */
  unregister(name: string): void {
    const module = this.modules.get(name)
    if (module?.onDestroy) {
      module.onDestroy()
    }
    this.modules.delete(name)
  }

  /**
   * 获取模块
   */
  get(name: string): EditorModule | undefined {
    return this.modules.get(name)
  }

  /**
   * 获取所有模块
   */
  getAll(): EditorModule[] {
    return Array.from(this.modules.values())
  }

  /**
   * 初始化所有模块
   */
  initModules(editor: EditorInstance): void {
    this.editor = editor
    this.modules.forEach((module) => {
      if (module.onInit) {
        module.onInit(editor)
      }
    })
  }

  /**
   * 销毁所有模块
   */
  destroyModules(): void {
    this.modules.forEach((module) => {
      if (module.onDestroy) {
        module.onDestroy()
      }
    })
    this.modules.clear()
    this.editor = null
  }
}

// 单例模式
export const moduleRegistry = new ModuleRegistry()
```

```typescript
// src/types/modules.ts
import type { BaseEditor } from 'slate'
import type { Component } from 'vue'
import type { EditorInstance } from './editor'

export interface EditorModule {
  // 模块标识
  name: string
  version: string
  description?: string

  // Slate 插件
  slatePlugin?: (editor: BaseEditor) => BaseEditor

  // 元素定义
  elements?: ElementDefinition[]

  // 菜单定义
  menus?: MenuDefinition[]

  // Vue 组件
  components?: Record<string, Component>

  // 工具栏配置
  toolbar?: ToolbarConfig

  // 生命周期钩子
  onInit?: (editor: EditorInstance) => void | Promise<void>
  onDestroy?: () => void
}

export interface ElementDefinition {
  type: string
  render: (props: RenderProps) => any // JSX 或 VNode
  parse?: (html: string) => any
  toHtml?: (element: any) => string
  isVoid?: boolean
  isInline?: boolean
}

export interface RenderProps {
  attributes: any
  children: any
  element: any
}

export interface MenuDefinition {
  key: string
  title: string
  icon?: string
  handler: (editor: EditorInstance, ...args: any[]) => void | Promise<void>
  isActive?: (editor: EditorInstance) => boolean
  isDisabled?: (editor: EditorInstance) => boolean
}

export interface ToolbarConfig {
  items?: string[] // 菜单 key 列表
  groups?: ToolbarGroup[]
}

export interface ToolbarGroup {
  key: string
  title: string
  items: string[]
}
```

### 3. 编辑器核心类

```typescript
// src/core/editor/EditorCore.ts
import { createEditor as createSlateEditor, Editor, Transforms } from 'slate'
import { withReact } from 'slate-react'
import { withHistory } from 'slate-history'
import { moduleRegistry } from '../modules/ModuleRegistry'
import { EventEmitter } from '../utils/EventEmitter'
import { htmlToSlate, slateToHtml } from '../utils/html-converter'
import type { EditorConfig, EditorInstance, CustomNode } from '@/types/editor'
import type { EditorModule } from '@/types/modules'

export class EditorCore implements EditorInstance {
  private editor: Editor
  private config: EditorConfig
  private eventEmitter: EventEmitter
  private container: HTMLElement | null = null

  constructor(config: EditorConfig = {}) {
    this.config = config
    this.eventEmitter = new EventEmitter()

    // 创建 Slate 编辑器
    this.editor = this.createSlateEditor()

    // 初始化模块
    this.initModules()
  }

  /**
   * 创建 Slate 编辑器实例
   */
  private createSlateEditor(): Editor {
    let editor = createSlateEditor()

    // 应用基础插件
    editor = withReact(editor)
    editor = withHistory(editor)

    // 应用模块插件
    const modules = moduleRegistry.getAll()
    modules.forEach((module) => {
      if (module.slatePlugin) {
        editor = module.slatePlugin(editor)
      }
    })

    return editor
  }

  /**
   * 初始化模块
   */
  private initModules(): void {
    moduleRegistry.initModules(this)
  }

  /**
   * 获取 HTML
   */
  getHtml(): string {
    return slateToHtml(this.editor.children)
  }

  /**
   * 设置 HTML
   */
  async setHtml(html: string): Promise<void> {
    const nodes = htmlToSlate(html)
    this.editor.children = nodes
    this.emit('change', this.getHtml())
  }

  /**
   * 获取 JSON
   */
  getJson(): CustomNode[] {
    return this.editor.children as CustomNode[]
  }

  /**
   * 设置 JSON
   */
  setJson(nodes: CustomNode[]): void {
    this.editor.children = nodes
    this.emit('change', this.getHtml())
  }

  /**
   * 插入节点
   */
  insertNode(node: CustomNode): void {
    Transforms.insertNodes(this.editor, node)
    this.emit('change', this.getHtml())
  }

  /**
   * 删除节点
   */
  deleteNode(path: number[]): void {
    Transforms.removeNodes(this.editor, { at: path })
    this.emit('change', this.getHtml())
  }

  /**
   * 聚焦
   */
  focus(): void {
    // 实现聚焦逻辑
  }

  /**
   * 失焦
   */
  blur(): void {
    // 实现失焦逻辑
  }

  /**
   * 事件监听
   */
  on(event: string, handler: Function): void {
    this.eventEmitter.on(event, handler)
  }

  /**
   * 取消事件监听
   */
  off(event: string, handler: Function): void {
    this.eventEmitter.off(event, handler)
  }

  /**
   * 触发事件
   */
  emit(event: string, ...args: any[]): void {
    this.eventEmitter.emit(event, ...args)
  }

  /**
   * 获取 Slate 编辑器实例（内部使用）
   */
  getSlateEditor(): Editor {
    return this.editor
  }

  /**
   * 注册模块
   */
  registerModule(module: EditorModule): void {
    moduleRegistry.register(module)
    // 重新创建编辑器以应用新模块的插件
    this.editor = this.createSlateEditor()
  }

  /**
   * 注销模块
   */
  unregisterModule(name: string): void {
    moduleRegistry.unregister(name)
    this.editor = this.createSlateEditor()
  }

  /**
   * 销毁编辑器
   */
  destroy(): void {
    moduleRegistry.destroyModules()
    this.eventEmitter.removeAllListeners()
    this.container = null
  }
}
```

### 4. Composition API 封装

```typescript
// src/composables/useEditor.ts
import { ref, computed, onUnmounted, watch } from 'vue'
import { EditorCore } from '@/core/editor/EditorCore'
import type { EditorConfig, EditorInstance } from '@/types/editor'

export function useEditor(config?: EditorConfig) {
  const editor = ref<EditorInstance | null>(null)
  const html = ref('')
  const isReady = ref(false)
  const isLoading = ref(false)

  // 创建编辑器实例
  const createEditor = () => {
    if (editor.value) {
      editor.value.destroy()
    }

    editor.value = new EditorCore(config)
    isReady.value = true

    // 监听内容变化
    editor.value.on('change', (newHtml: string) => {
      html.value = newHtml
    })

    return editor.value
  }

  // 设置 HTML
  const setHtml = async (content: string) => {
    if (!editor.value) return

    isLoading.value = true
    try {
      await editor.value.setHtml(content)
    } finally {
      isLoading.value = false
    }
  }

  // 获取 HTML
  const getHtml = (): string => {
    return editor.value?.getHtml() || ''
  }

  // 获取 JSON
  const getJson = () => {
    return editor.value?.getJson() || []
  }

  // 插入节点
  const insertNode = (node: any) => {
    editor.value?.insertNode(node)
  }

  // 聚焦
  const focus = () => {
    editor.value?.focus()
  }

  // 失焦
  const blur = () => {
    editor.value?.blur()
  }

  // 清理
  onUnmounted(() => {
    editor.value?.destroy()
  })

  return {
    editor: computed(() => editor.value),
    html,
    isReady,
    isLoading,
    createEditor,
    setHtml,
    getHtml,
    getJson,
    insertNode,
    focus,
    blur
  }
}
```

### 5. Vue 组件实现

```vue
<!-- src/components/Editor.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useEditor } from '@/composables/useEditor'
import Toolbar from './Toolbar/Toolbar.vue'
import EditorContent from './EditorContent.vue'
import type { EditorConfig } from '@/types/editor'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    config?: EditorConfig
  }>(),
  {
    modelValue: '',
    config: () => ({})
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [value: string]
  'ready': [editor: any]
}>()

const { editor, html, isReady, setHtml, createEditor } = useEditor(props.config)

// 监听内容变化
watch(html, (newHtml) => {
  emit('update:modelValue', newHtml)
  emit('change', newHtml)
})

// 监听外部值变化
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue !== html.value && isReady.value) {
      setHtml(newValue)
    }
  }
)

onMounted(async () => {
  const instance = createEditor()

  // 设置初始内容
  if (props.modelValue) {
    await setHtml(props.modelValue)
  }

  emit('ready', instance)
})

onUnmounted(() => {
  editor.value?.destroy()
})
</script>

<template>
  <div class="editor-container">
    <Toolbar v-if="isReady && editor" :editor="editor" />
    <EditorContent v-if="isReady && editor" :editor="editor" />
  </div>
</template>

<style scoped lang="less">
.editor-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
}
</style>
```

```vue
<!-- src/components/EditorContent.vue -->
<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { Slate, Editable, withReact, useSlate } from 'slate-react'
import { EditorCore } from '@/core/editor/EditorCore'
import type { EditorInstance } from '@/types/editor'

const props = defineProps<{
  editor: EditorInstance
}>()

const containerRef = ref<HTMLElement>()

onMounted(async () => {
  await nextTick()
  if (containerRef.value && props.editor instanceof EditorCore) {
    const slateEditor = props.editor.getSlateEditor()
    // 渲染 Slate 编辑器到容器
  }
})
</script>

<template>
  <div ref="containerRef" class="editor-content">
    <!-- Slate 编辑器内容 -->
  </div>
</template>

<style scoped lang="less">
.editor-content {
  min-height: 300px;
  padding: 16px;
  outline: none;
}
</style>
```

---

## 🔌 模块开发示例

### 图片模块示例

```typescript
// src/modules/media/image/index.ts
import { moduleRegistry } from '@/core/modules/ModuleRegistry'
import { ImageElement } from './types'
import { imagePlugin } from './plugin'
import { renderImage } from './render'
import { imageToHtml, parseImageHtml } from './converter'
import { imageMenus } from './menus'
import type { EditorModule } from '@/types/modules'

export const imageModule: EditorModule = {
  name: 'image',
  version: '1.0.0',
  description: '图片模块',

  slatePlugin: imagePlugin,

  elements: [
    {
      type: 'image',
      render: renderImage,
      toHtml: imageToHtml,
      parse: parseImageHtml,
      isVoid: true
    }
  ],

  menus: imageMenus,

  onInit: (editor) => {
    console.log('Image module initialized')
  },

  onDestroy: () => {
    console.log('Image module destroyed')
  }
}

// 注册模块
moduleRegistry.register(imageModule)
```

```typescript
// src/modules/media/image/types.ts
export interface ImageElement {
  type: 'image'
  src: string
  alt?: string
  width?: number
  height?: number
  align?: 'left' | 'center' | 'right'
  borderRadius?: number
  resourceId?: string
  resourceType?: string
  resourceSource?: string
  children: [{ text: '' }]
}
```

```typescript
// src/modules/media/image/plugin.ts
import { Editor } from 'slate'
import type { BaseEditor } from 'slate'

export function imagePlugin(editor: BaseEditor): BaseEditor {
  const { isVoid } = editor

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element)
  }

  return editor
}
```

```vue
<!-- src/modules/media/image/Render.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import type { ImageElement } from './types'

const props = defineProps<{
  element: ImageElement
  attributes: any
}>()

const imageStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.element.width) {
    style.width = `${props.element.width}px`
  }
  
  if (props.element.height) {
    style.height = `${props.element.height}px`
  }
  
  if (props.element.borderRadius) {
    style.borderRadius = `${props.element.borderRadius}px`
  }
  
  if (props.element.align) {
    style.float = props.element.align
  }
  
  return style
})
</script>

<template>
  <img
    v-bind="attributes"
    :src="element.src"
    :alt="element.alt"
    :style="imageStyle"
    class="editor-image"
  />
</template>

<style scoped lang="less">
.editor-image {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 8px 0;
}
</style>
```

---

## 🧪 测试示例

```typescript
// tests/unit/core/EditorCore.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { EditorCore } from '@/core/editor/EditorCore'

describe('EditorCore', () => {
  let editor: EditorCore

  beforeEach(() => {
    editor = new EditorCore()
  })

  afterEach(() => {
    editor.destroy()
  })

  it('should create editor instance', () => {
    expect(editor).toBeDefined()
  })

  it('should get and set HTML', async () => {
    const html = '<p>Hello World</p>'
    await editor.setHtml(html)
    expect(editor.getHtml()).toContain('Hello World')
  })

  it('should emit change event', async () => {
    let changed = false
    editor.on('change', () => {
      changed = true
    })

    await editor.setHtml('<p>Test</p>')
    expect(changed).toBe(true)
  })
})
```

---

## 📝 最佳实践

### 1. 模块开发规范

- ✅ 每个模块独立目录
- ✅ 导出统一的模块接口
- ✅ 提供完整的类型定义
- ✅ 实现生命周期钩子
- ✅ 编写单元测试

### 2. 性能优化

- ✅ 使用 `shallowRef` 优化大对象
- ✅ 使用 `computed` 缓存计算结果
- ✅ 使用防抖节流处理频繁操作
- ✅ 懒加载非关键模块
- ✅ 虚拟滚动处理长列表

### 3. 错误处理

- ✅ 使用 try-catch 包裹异步操作
- ✅ 提供友好的错误提示
- ✅ 记录错误日志
- ✅ 实现错误恢复机制

### 4. 代码组织

- ✅ 单一职责原则
- ✅ 依赖注入
- ✅ 接口隔离
- ✅ 开闭原则

---

## 🚀 下一步

1. 按照阶段一的任务清单开始实施
2. 先实现基础架构和核心功能
3. 逐步迁移各个模块
4. 持续优化和测试

**祝开发顺利！** 🎉

