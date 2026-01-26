import { create } from 'zustand'

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem('linkUp-theme')|| 'coffee',
  setTheme:(theme)=>{
    localStorage.setItem('linkUp-theme',theme)
    set({theme})
},
}))