'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Equal, X } from 'lucide-react'
import { Button } from '@/components/ui/liquid-glass-button'
import { TextShimmerWave } from '@/components/ui/text-shimmer-wave'
import React from 'react'
import { cn } from '@/lib/utils'

// const menuItems = [
//     { name: 'Products', href: '#link' },

//     { name: 'Pricing', href: '#link' },
//     { name: 'About', href: '#link' },
// ]

export const Header = () => {
    const pathname = usePathname()
    const [menuState, setMenuState] = React.useState(false)
    const [isScrolled, setIsScrolled] = React.useState(false)

    // Hide auth buttons on signin/signup pages
    const isAuthPage = pathname === '/signin' || pathname === '/signup'

    React.useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])
    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className="fixed left-0 w-full z-20 px-2">
                <div className={cn('mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12', isScrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5')}>
                    <div className="relative flex flex-wrap items-center justify-between gap-6 lg:gap-0 py-2">
                        <div className="flex w-full justify-between lg:w-auto">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex gap-2 items-center">
                                <Image
                                    src="/logo.png"
                                    alt="Somleng Logo"
                                    width={32}
                                    height={32}
                                    className="w-10 h-10 border rounded-md"
                                />
                                <p className='font-semibold text-xl tracking-tighter'> Somleng</p>
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="absolute inset-0 m-auto hidden size-fit lg:block">
                            <ul className="flex gap-8 text-base">
                                {/* {menuItems.map((item, index) => (
                                    <li key={index}>
                                        <Link
                                            href={item.href}
                                            className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                            <span>{item.name}</span>
                                        </Link>
                                    </li>
                                ))} */}
                            </ul>
                        </div>

                        <div className="bg-bg in-data-[state=active]:block lg:in-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {/* {menuItems.map((item, index) => (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                <span>{item.name}</span>
                                            </Link>
                                        </li>
                                    ))} */}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">

                                {pathname !== '/signin' && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        size="default"
                                        className={cn(isScrolled && 'lg:hidden')}>
                                        <Link href="/signin" className="group relative">
                                            <span className="group-hover:hidden">Login</span>
                                            <span className="hidden group-hover:inline-block">
                                                <TextShimmerWave
                                                    waveOnly={true}
                                                    fontSize="1.1rem"
                                                >
                                                    Login
                                                </TextShimmerWave>
                                            </span>
                                        </Link>
                                    </Button>
                                )}
                                {pathname !== '/signup' && (
                                    <Button
                                        asChild
                                        size="default"
                                        className={`${cn(isScrolled && 'lg:hidden')} bg-accent text-text`}>
                                        <Link href="/signup" className="group relative">
                                            <span className="group-hover:hidden">Sign Up</span>
                                            <span className="hidden group-hover:inline-block">
                                                <TextShimmerWave
                                                    waveOnly={true}
                                                    fontSize="1.1rem"
                                                >
                                                    Sign Up
                                                </TextShimmerWave>
                                            </span>
                                        </Link>
                                    </Button>
                                )}
                                {/* <Button
                                    asChild
                                    variant="outline"
                                    size="default"
                                    className={cn(isScrolled && 'lg:hidden')}>
                                    <Link href="/dashboard" className="group relative">
                                        <span className="group-hover:hidden">Dashboard</span>
                                        <span className="hidden group-hover:inline-block">
                                            <TextShimmerWave 
                                                waveOnly={true}
                                                fontSize="1.1rem"
                                            >
                                                Dashboard
                                            </TextShimmerWave>
                                        </span>
                                    </Link>
                                </Button> */}
                                {!isAuthPage && (
                                    <Button
                                        asChild
                                        size="default"
                                        className={cn(isScrolled ? 'lg:inline-flex' : 'hidden')}>
                                        <Link href="/signup" className="group relative">
                                            <span className="group-hover:hidden">Get Started</span>
                                            <span className="hidden group-hover:inline-block">
                                                <TextShimmerWave
                                                    waveOnly={true}
                                                    fontSize="1.1rem"
                                                >
                                                    Get Started
                                                </TextShimmerWave>
                                            </span>
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}