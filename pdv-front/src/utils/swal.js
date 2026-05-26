import Swal from 'sweetalert2';

// Shared theme for all SweetAlert popups
const theme = {
    confirmButtonColor: '#ed6f00',
    cancelButtonColor: '#8898aa',
    iconColor: '#001f6c',
    customClass: {
        popup: '!rounded-2xl !shadow-xl',
        title: '!text-[#001f6c] !font-bold',
        confirmButton: '!rounded-full !px-6 !font-semibold',
        cancelButton: '!rounded-full !px-6 !font-semibold',
    },
};

/** Success notification toast (auto-closes) */
export const showSuccess = (message) => {
    return Swal.fire({
        ...theme,
        icon: 'success',
        title: '¡Éxito!',
        text: message,
        timer: 2500,
        showConfirmButton: false,
    });
};

/** Error notification */
export const showError = (message) => {
    return Swal.fire({
        ...theme,
        icon: 'error',
        title: 'Error',
        text: message,
    });
};

/** Confirm dialog — returns true if user confirmed */
export const showConfirm = async (message, title = '¿Estás seguro?') => {
    const result = await Swal.fire({
        ...theme,
        icon: 'warning',
        title,
        text: message,
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
    });
    return result.isConfirmed;
};

/** Info notification */
export const showInfo = (message) => {
    return Swal.fire({
        ...theme,
        icon: 'info',
        title: 'Información',
        text: message,
    });
};

export default Swal;
