FROM ubuntu:20.04

RUN apt-get update \
  && apt-get install -y python3 python3-pip python3-dev \
  build-essential gcc g++ make \
  curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs

WORKDIR /app

COPY . .

RUN npm install

RUN echo "List Project"
RUN ls /app && cat /app/firebase-credentials.json

ENV PORT 5000
EXPOSE 5000  

CMD [ "cd", "/app", "&&", "npm", "run", "start" ]