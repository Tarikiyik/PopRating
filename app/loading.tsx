import CircularProgress from "@/components/circularProgress";

export default function Loading() {
    return(
        <div className={"flex justify-center items-center w-full h-screen"}>
            <CircularProgress/>
        </div>
    )
}