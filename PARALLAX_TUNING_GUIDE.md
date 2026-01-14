# Parallax Scrolling System - Tuning Guide

## Installation

```bash
npm install lenis gsap @gsap/react
```

## Dependencies

- `lenis` - Smooth scrolling library
- `gsap` - Animation library with ScrollTrigger plugin
- `@gsap/react` - React hooks for GSAP

## Quick Start

1. Wrap your app with `SmoothScrollProvider` in `App.jsx`
2. Use `<Parallax>` for elements that drift at different speeds
3. Use `<Reveal>` for scroll-triggered animations

## Tuning Parameters

### Lenis Smooth Scroll Settings

Located in `SmoothScrollProvider` config prop:

```tsx
<SmoothScrollProvider config={{
  duration: 1.2,        // Scroll duration (lower = faster, higher = slower)
  lerp: 0.1,            // Linear interpolation (0-1, lower = smoother but slower response)
  wheelMultiplier: 0.8, // Mouse wheel sensitivity (0.5-1.5 recommended)
  touchMultiplier: 2,   // Touch scroll sensitivity (1-3 recommended)
}}>
```

**For More Smooth:**
- Increase `duration`: `1.5 - 2.0`
- Decrease `lerp`: `0.05 - 0.08`
- Decrease `wheelMultiplier`: `0.6 - 0.7`

**For Less Smooth (More Responsive):**
- Decrease `duration`: `0.8 - 1.0`
- Increase `lerp`: `0.15 - 0.2`
- Increase `wheelMultiplier`: `1.0 - 1.2`

### Parallax Speed Values

**Best Practices:**
- Keep values **small**: `-0.3` to `0.3` range
- Positive values = element moves slower (parallax down)
- Negative values = element moves faster (parallax up)
- **Recommended ranges:**
  - Subtle: `0.1 - 0.2` or `-0.1 - -0.2`
  - Medium: `0.2 - 0.4` or `-0.2 - -0.4`
  - Strong: `0.4 - 0.6` or `-0.4 - -0.6` (use sparingly)

**Example:**
```tsx
<Parallax speed={0.15}>  {/* Subtle downward drift */}
<Parallax speed={-0.25}> {/* Medium upward drift */}
```

### Parallax Distance Limits

**Maximum recommended movement:**
- **20-80px** total movement is ideal
- Calculate: `speed * 100 * viewportHeight`
- Example: `speed={0.2}` on 1000px viewport = 200px max (too much!)
- Better: `speed={0.08}` = 80px max ✅

**For different screen sizes:**
- Mobile: Use smaller speeds (`0.05 - 0.15`)
- Desktop: Can use slightly larger (`0.1 - 0.25`)

### Reveal Animation Settings

**Stagger Timing:**
```tsx
<Reveal type="text" stagger={0.1}>  {/* 0.1s between each child */}
<Reveal type="text" stagger={0.05}> {/* Faster stagger */}
<Reveal type="text" stagger={0.2}>  {/* Slower stagger */}
```

**Start/End Positions:**
```tsx
start="top 80%"  // Animation starts when top of element hits 80% of viewport
end="top 20%"    // Animation ends when top of element hits 20% of viewport
```

**Common Patterns:**
- Early reveal: `start="top 90%"` (triggers earlier)
- Late reveal: `start="top 60%"` (triggers later)
- Long animation: `start="top bottom" end="top top"` (full viewport scroll)

## Performance Optimization

### Avoiding Jitter on Low-End Devices

1. **Reduce Parallax Complexity:**
   - Use fewer parallax elements
   - Lower parallax speeds (`0.1` or less)
   - Disable parallax on mobile: `{isMobile ? null : <Parallax>}`

2. **Optimize Images:**
   - Use `loading="lazy"` on all images
   - Compress images (WebP format recommended)
   - Use appropriate sizes (don't load 4K images for thumbnails)

3. **Limit Animations:**
   - Don't animate more than 10-15 elements simultaneously
   - Use `will-change: transform` sparingly (only on animated elements)

4. **Device Detection:**
```tsx
const isLowEnd = window.navigator.hardwareConcurrency <= 4
if (isLowEnd) {
  // Disable heavy parallax
  return <div>{children}</div>
}
```

### GPU Acceleration

Already handled automatically:
- All transforms use `translate3d(0, 0, 0)`
- `will-change: transform` applied when needed
- GSAP uses transform-based animations

### Memory Management

- GSAP Context automatically cleans up on unmount
- ScrollTrigger instances are properly destroyed
- Lenis RAF loop is cleaned up

## Accessibility

### Reduced Motion Support

Automatically handled:
- `prefers-reduced-motion` disables smooth scroll
- Parallax effects are minimal or disabled
- Reveals use simple fades instead of complex animations

**Testing:**
- macOS: System Preferences → Accessibility → Display → Reduce motion
- Windows: Settings → Ease of Access → Display → Show animations
- Browser DevTools: Toggle `prefers-reduced-motion` in rendering tab

## Common Issues & Solutions

### Double Animation in React Strict Mode

**Fixed:** Using `useGSAP` hook and proper cleanup prevents double-init.

### ScrollTrigger Not Updating

**Solution:** Call `ScrollTrigger.refresh()` after:
- Images load
- Dynamic content changes
- Window resize (handled automatically)

### Lenis Not Smooth

**Check:**
1. Is `SmoothScrollProvider` wrapping your app?
2. Are there conflicting scroll libraries?
3. Try increasing `duration` and decreasing `lerp`

### Parallax Too Strong/Jarring

**Solution:**
- Reduce speed values by 50%
- Use `start` and `end` to limit animation range
- Add `ease: 'power2.out'` for smoother transitions

### Layout Shift on Scroll

**Prevent:**
- Set explicit dimensions on images
- Use `aspect-ratio` CSS property
- Reserve space for animated elements

## Example Configurations

### Subtle Premium Feel
```tsx
<SmoothScrollProvider config={{
  duration: 1.5,
  lerp: 0.08,
  wheelMultiplier: 0.7,
}}>
```

### Responsive & Snappy
```tsx
<SmoothScrollProvider config={{
  duration: 1.0,
  lerp: 0.15,
  wheelMultiplier: 1.0,
}}>
```

### Mobile Optimized
```tsx
const isMobile = window.innerWidth < 768
<SmoothScrollProvider config={{
  duration: isMobile ? 0.8 : 1.2,
  lerp: isMobile ? 0.2 : 0.1,
  touchMultiplier: isMobile ? 1.5 : 2,
}}>
```

## Best Practices

1. **Start Subtle:** Begin with small parallax values (`0.1`) and increase if needed
2. **Test on Real Devices:** Low-end phones will show jitter first
3. **Progressive Enhancement:** Site should work without JavaScript
4. **Monitor Performance:** Use Chrome DevTools Performance tab
5. **Limit Parallax Elements:** 3-5 parallax elements per viewport max
6. **Use Reveals Strategically:** Not every element needs animation

## Debugging

Enable GSAP markers to see ScrollTrigger ranges:
```tsx
ScrollTrigger.config({ markers: true })
```

Check Lenis scroll position:
```tsx
console.log(window.lenis?.scroll)
```

Monitor FPS:
- Chrome DevTools → Performance → Record → Check FPS graph
- Target: 60fps, acceptable: 50fps+, problematic: <45fps

