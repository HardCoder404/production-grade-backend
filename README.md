# Deployment Flow (CICD setup here)

1. GitHub (production-grade-backend)
2. GitHub Actions
3. Docker build
4. Push image → AWS ECR
5. SSH → EC2
6. Docker pull + run (prod)

### Deployed URl: http://52.66.184.241/api/v1
### Response: 
{
  "message": "API is live",
  "version": "1.0.0",
  "status": "OK",
  "timestamp": "2025-12-14T17:19:09.314Z"
}
