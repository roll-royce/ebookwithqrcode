export function findMax(arr: number[]): number {
    if (arr.length === 0) {
      throw new Error('Array is empty');
    }
  
    let max = arr[0];
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
        max = arr[i];
      }
    }
    return max;
  }