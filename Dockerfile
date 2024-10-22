FROM denoland/deno:2.0.2

WORKDIR /app
COPY . .
RUN deno cache main.ts
RUN deno task build

EXPOSE 8000

CMD ["run", "-A", "main.ts"]