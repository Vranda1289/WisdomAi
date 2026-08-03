export const animation = {
  keyframes: {
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-5px)' },
    },
    breathe: {
      '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
      '50%': { opacity: '1', transform: 'scale(1.02)' },
    },
  },
  durations: {
    slow: '1200ms',
    slower: '2000ms',
    slowest: '2500ms',
  }
};
