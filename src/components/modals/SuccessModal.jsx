import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { CheckCircle } from "lucide-react";

export const SuccessModal = ({
  message,
  onClose
}) => {

  return (
    <Modal
      isOpen={!!message}
      onClose={onClose}
      title="Operação concluída"
    >

      <div className="space-y-4">

        <div className="flex items-center text-green-700">
          <CheckCircle className="w-5 h-5 mr-2" />
          <span>{message}</span>
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>
            OK
          </Button>
        </div>

      </div>

    </Modal>
  );
};