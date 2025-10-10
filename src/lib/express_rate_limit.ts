import {rateLimit} from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window duration 
    limit: 60, // Allow 60 requests per `window` per IP
    standardHeaders: 'draft-8', // Use the standard rate limit headers  
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message : {
        error: "Too many requests, please try again later."
    }
});

export default limiter;