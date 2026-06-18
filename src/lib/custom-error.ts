class CustomError extends Error {
    // Definisikan properti yang harus ada di class, bisa seperti di bawah ini atau menggunakan parameter properties
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode;
        this.name = "CustomError";

        // Memperbaiki prototype chain
        Object.setPrototypeOf(this, CustomError.prototype)
    }
}

export { CustomError };