#!/bin/bash

echo "🔧 Running custom Vercel build..."
npx prisma generate
npx prisma db push
npm run next-build
