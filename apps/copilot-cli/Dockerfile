FROM node:22-bookworm-slim

WORKDIR /srv

RUN npm install -g @github/copilot

COPY start-copilot-cli.sh /srv/start-copilot-cli.sh
RUN chmod +x /srv/start-copilot-cli.sh

EXPOSE 4321

CMD ["/srv/start-copilot-cli.sh"]
