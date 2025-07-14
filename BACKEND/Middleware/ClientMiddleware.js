function ClientMiddleware(req, res, next) {
    if(req.user.role === 'client') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied: client only' });
    }
}
export default ClientMiddleware;