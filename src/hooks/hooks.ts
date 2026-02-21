import type { AppDispatch } from "@/store/store";
import type { RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";


export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
