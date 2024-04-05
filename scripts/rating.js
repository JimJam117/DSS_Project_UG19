export function calcStars(rating) {
    if (rating <= 0.5) {
        return "☆ ☆ ☆ ☆ ☆"
    }
    else if (rating <= 1.5) {
        return "★ ☆ ☆ ☆ ☆"
    }
    else if (rating <= 2.5) {
        return "★ ★ ☆ ☆ ☆"
    }
    else if (rating <= 3.5) {
        return "★ ★ ★ ☆ ☆"
    }
    else if (rating <= 4.5) {
        return "★ ★ ★ ★ ☆"
    }
    else {
         return "★ ★ ★ ★ ★"
    }
}
