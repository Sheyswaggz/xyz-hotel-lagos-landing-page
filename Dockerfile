FROM nginx:1.27-alpine

LABEL maintainer="XYZ Hotel Lagos" \
      description="XYZ Hotel Lagos Landing Page" \
      version="1.0.0"

COPY --chown=nginx:nginx nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx:nginx index.html /usr/share/nginx/html/
COPY --chown=nginx:nginx robots.txt /usr/share/nginx/html/
COPY --chown=nginx:nginx sitemap.xml /usr/share/nginx/html/
COPY --chown=nginx:nginx css/ /usr/share/nginx/html/css/
COPY --chown=nginx:nginx js/ /usr/share/nginx/html/js/

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

STOPSIGNAL SIGTERM

CMD ["nginx", "-g", "daemon off;"]