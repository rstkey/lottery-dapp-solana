import toast, { Toast, ToastOptions, ToastType } from "react-hot-toast";


const useToast = () => {

  const showToast = (message: string, option?: ToastOptions): Toast => {
    return toast(message, {
      duration: 2500,
      position: 'bottom-right',
      ...option
    })
  }


  return showToast;
}

export default useToast;