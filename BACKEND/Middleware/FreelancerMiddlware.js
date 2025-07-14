function freelancerMiddleware(req, res, next) {
    if (req.user.role === 'freelancer') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: freelancer only' });
    }
} export default freelancerMiddleware;