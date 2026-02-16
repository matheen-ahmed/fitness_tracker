import {createContext, useContext, useEffect, useState} from 'react'


interface ThemeContextType{
    theme:string,
    toggleTheme:()=> void;
}

const ThemeContext=createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({children}:{children:React.ReactNode}){

   const [theme, setTheme] = useState<"light" | "dark">(() => {
  const storedTheme = localStorage.getItem("theme");
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
});


    //  update theme when stat chnges
    useEffect(()=>{
        const root=window.document.documentElement;
        root.classList.remove('light','dark');
        root.classList.add(theme);
        localStorage.setItem('theme',theme);
    },[theme])

  const toggleTheme = () => {
  setTheme((prev) => {
    console.log("prev:", prev);
    return prev === "light" ? "dark" : "light";
  });
};


    return <ThemeContext.Provider value={{theme,toggleTheme}}>
{children}
    </ThemeContext.Provider>
}

export function useTheme(){
    const context=useContext(ThemeContext)
    if(context===undefined){
        throw new Error('useTheme must be used within ThemeProvider')
    }
    return context;
}