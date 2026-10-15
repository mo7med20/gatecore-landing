# Use the official lightweight Nginx image
FROM nginx:alpine

# Copy your landing page files into Nginx's public directory
COPY . /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx in the foreground (Docker manages it in the background)
CMD ["nginx", "-g", "daemon off;"]