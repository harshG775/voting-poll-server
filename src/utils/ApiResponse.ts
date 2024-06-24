class ApiResponse {
    public statusCode: number;
    public data: any;
    public message: string;
    public status: string;
    public success: boolean;

    constructor(
        statusCode: number,
        data: any,
        message: string = "Internal Server Error",
        status: string = "success"
    ) {
        this.statusCode = statusCode;
        this.data = data;
        this.message = message;
        this.status = status;
        this.success = statusCode >= 200 && statusCode < 300;
    }
}

export default ApiResponse;
