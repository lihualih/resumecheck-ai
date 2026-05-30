# ResumeCheck.ai — Deployment Guide

## What This Is
An AI-powered resume analyzer that provides instant feedback, scoring, and improvement suggestions. Works entirely in the browser — no server needed.

## Revenue Model
- **Freemium**: 3 free analyses per day (tracked in localStorage)
- **Upgrade path**: Add Stripe/Paddle payment for unlimited access ($5-10/month)
- **Affiliate**: Recommend resume writing services, job boards

## Deploy (Free)

### Option 1: Cloudflare Pages (Recommended)
1. Push to GitHub
2. Cloudflare Pages → Connect to Git → Deploy
3. Custom domain: resumecheck.ai (or similar)

### Option 2: Vercel
1. Push to GitHub
2. Vercel → Import → Deploy

## Monetization Steps
1. Get traffic via SEO + Product Hunt launch
2. Add Stripe checkout for Pro plan
3. Add Google AdSense for free-tier users
4. Submit to AI tool directories (theresanaiforthat.com, futuretools.io)
