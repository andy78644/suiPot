'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface NumberSelectorProps {
  onSubmit: (numbers: number[]) => void;
  isLoading?: boolean;
  className?: string;
  showDevTools?: boolean;
}

export default function NumberSelector({ 
  onSubmit, 
  isLoading = false, 
  className,
  showDevTools = false 
}: NumberSelectorProps) {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  // 生成 1-50 的號碼
  const availableNumbers = Array.from({ length: 50 }, (_, i) => i + 1);

  const handleNumberClick = (number: number) => {
    if (selectedNumbers.includes(number)) {
      // 取消選擇
      setSelectedNumbers(prev => prev.filter(n => n !== number));
    } else if (selectedNumbers.length < 6) {
      // 選擇號碼（最多6個）
      setSelectedNumbers(prev => [...prev, number].sort((a, b) => a - b));
    }
  };

  const handleRandomSelect = () => {
    const randomNumbers: number[] = [];
    while (randomNumbers.length < 6) {
      const num = Math.floor(Math.random() * 50) + 1;
      if (!randomNumbers.includes(num)) {
        randomNumbers.push(num);
      }
    }
    setSelectedNumbers(randomNumbers.sort((a, b) => a - b));
  };

  const handleClear = () => {
    setSelectedNumbers([]);
  };

  const handleSubmit = () => {
    if (selectedNumbers.length === 6) {
      onSubmit(selectedNumbers);
      if (!showDevTools) {
        // 真實模式下提交後清空選擇
        setSelectedNumbers([]);
        setIsVisible(false);
      }
    }
  };

  const handleQuickPick = () => {
    handleRandomSelect();
  };

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        className={cn("w-full", className)}
      >
        選擇號碼購票
      </Button>
    );
  }

  return (
    <div className={cn("bg-white rounded-lg border shadow-sm p-6", className)}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          選擇您的幸運號碼
          {showDevTools && (
            <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              模擬模式
            </span>
          )}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </Button>
      </div>

      {/* 已選號碼顯示 */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">
            已選號碼 ({selectedNumbers.length}/6):
          </span>
        </div>
        <div className="flex gap-2 flex-wrap min-h-[3rem] p-3 bg-gray-50 rounded-lg border">
          {selectedNumbers.length === 0 ? (
            <span className="text-gray-400 text-sm">請選擇 6 個號碼</span>
          ) : (
            selectedNumbers.map((number, index) => (
              <div
                key={index}
                className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-blue-600 transition-colors"
                onClick={() => handleNumberClick(number)}
                title="點擊取消選擇"
              >
                {number}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 號碼選擇網格 */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">
          選擇號碼 (1-50):
        </div>
        <div className="grid grid-cols-10 gap-1">
          {availableNumbers.map((number) => {
            const isSelected = selectedNumbers.includes(number);
            const isDisabled = !isSelected && selectedNumbers.length >= 6;
            
            return (
              <button
                key={number}
                onClick={() => handleNumberClick(number)}
                disabled={isDisabled}
                className={cn(
                  "w-8 h-8 text-xs font-medium rounded transition-all duration-150",
                  "hover:scale-105 active:scale-95",
                  isSelected
                    ? "bg-blue-500 text-white shadow-md"
                    : isDisabled
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                )}
              >
                {number}
              </button>
            );
          })}
        </div>
      </div>

      {/* 操作按鈕 */}
      <div className="flex gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={handleQuickPick}
          size="sm"
        >
          🎲 快選
        </Button>
        
        <Button
          variant="outline"
          onClick={handleClear}
          size="sm"
          disabled={selectedNumbers.length === 0}
        >
          🗑️ 清空
        </Button>
        
        <div className="flex-1" />
        
        <Button
          onClick={handleSubmit}
          disabled={selectedNumbers.length !== 6 || isLoading}
          loading={isLoading}
          className="min-w-[120px]"
        >
          {showDevTools ? '模擬購票' : '確認購票'}
          {selectedNumbers.length === 6 && (
            <span className="ml-1 text-xs">
              ({selectedNumbers.join(', ')})
            </span>
          )}
        </Button>
      </div>

      {/* 說明文字 */}
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>• 請選擇 6 個不同的號碼 (1-50)</p>
        <p>• 點擊已選號碼可以取消選擇</p>
        <p>• 使用「快選」可以隨機選擇 6 個號碼</p>
        {showDevTools && (
          <p className="text-yellow-600">• 模擬模式：此操作不會產生真實交易</p>
        )}
      </div>
    </div>
  );
}
