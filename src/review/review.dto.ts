import { IsNotEmpty } from "class-validator"

export class reviewDto{
    @IsNotEmpty()
    text : string
    @IsNotEmpty()
    rating : number
    @IsNotEmpty()
    hotelId: number
}

export class updateReviewDto{
    @IsNotEmpty()
    text:string
    @IsNotEmpty()
    rating:number
    @IsNotEmpty()
    hotelId:number
}
