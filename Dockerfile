FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev
COPY backend ./backend
COPY frontend-vanilla ./frontend-vanilla
ENV PORT=5000
EXPOSE 5000
CMD ["node", "backend/server.js"]
