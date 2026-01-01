FROM denoland/deno:2.3.1

WORKDIR /app

VOLUME /app/dat
VOLUME /app/data
VOLUME /app/sync

COPY . .

RUN deno install -gA main.ts
RUN deno install -gA processor.js

CMD [ "deno", "task", "run" ]

