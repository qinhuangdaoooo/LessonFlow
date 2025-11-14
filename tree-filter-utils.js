/**
 * 过滤树形选择数组，移除被父级节点包含的子级节点
 * @param {string[]} selectedValues - 选中的值数组，格式如 ['股票-风格因子-价值', '股票']
 * @param {string} separator - 分隔符，默认为 '-'
 * @returns {string[]} 过滤后的数组
 */
function filterTreeSelection(selectedValues, separator = '-') {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) {
    return selectedValues;
  }

  // 去重并排序，短的路径排在前面
  const uniqueValues = [...new Set(selectedValues)].sort((a, b) => a.length - b.length);

  const result = [];

  for (let i = 0; i < uniqueValues.length; i++) {
    const currentValue = uniqueValues[i];
    let isChildOfExisting = false;

    // 检查当前值是否是已经在结果中的某个值的子级
    for (let j = 0; j < result.length; j++) {
      const existingValue = result[j];

      // 如果当前值以某个已存在的值开头，且下一个字符是分隔符，说明是子级
      if (currentValue.startsWith(existingValue + separator)) {
        isChildOfExisting = true;
        break;
      }
    }

    // 如果不是子级，则添加到结果中
    if (!isChildOfExisting) {
      // 同时需要移除结果中所有是当前值子级的项
      const filteredResult = result.filter((existingValue) => {
        return !existingValue.startsWith(currentValue + separator);
      });

      filteredResult.push(currentValue);
      result.length = 0;
      result.push(...filteredResult);
    }
  }

  return result;
}

// 使用示例和测试
console.log('=== 测试用例 ===');

// 测试用例1：你提到的场景
const test1 = ['股票-风格因子-价值', '股票'];
console.log('输入:', test1);
console.log('输出:', filterTreeSelection(test1));
console.log(''); // 输出: ['股票']

// 测试用例2：多个不同父级
const test2 = ['股票-风格因子-价值', '债券-信用债', '股票', '基金'];
console.log('输入:', test2);
console.log('输出:', filterTreeSelection(test2));
console.log(''); // 输出: ['股票', '债券-信用债', '基金']

// 测试用例3：多层嵌套
const test3 = ['股票-风格因子-价值', '股票-风格因子', '股票'];
console.log('输入:', test3);
console.log('输出:', filterTreeSelection(test3));
console.log(''); // 输出: ['股票']

// 测试用例4：同级不同分支
const test4 = ['股票-风格因子-价值', '股票-风格因子-成长', '股票-行业因子'];
console.log('输入:', test4);
console.log('输出:', filterTreeSelection(test4));
console.log(''); // 输出: ['股票-风格因子-价值', '股票-风格因子-成长', '股票-行业因子']

// 测试用例5：空数组和重复值
const test5 = ['股票', '股票', '股票-风格因子'];
console.log('输入:', test5);
console.log('输出:', filterTreeSelection(test5));
console.log(''); // 输出: ['股票']

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = filterTreeSelection;
}

// 如果在浏览器环境中，添加到全局对象
if (typeof window !== 'undefined') {
  window.filterTreeSelection = filterTreeSelection;
}
