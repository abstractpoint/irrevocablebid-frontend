import * as React from "react";

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import { SellerEscrow } from "../../../lib";
import { serializeSellOrder } from "../../../lib";

/******************************************************************************/
/* Guarantor Link Modal Component */
/******************************************************************************/

type GuarantorLinkModalProps = {
  open: boolean;
  onClose: () => void;
  sellerEscrow: SellerEscrow;
};

export function GuarantorLinkModal(props: GuarantorLinkModalProps) {
  const sellOrderData = serializeSellOrder(props.sellerEscrow.sellOrder);
  const urlSearchParams = new URLSearchParams({sell: sellOrderData});
  const guaranteeURL = window.location.origin + "/#/guarantee/?" + urlSearchParams.toString();

  return (
    <Dialog open={props.open} onClose={props.onClose} aria-labelledby="simple-modal-title" >
      <div>
        <DialogTitle id="simple-modal-title">Guarantor Link</DialogTitle>
        <DialogContent>
          <a href={guaranteeURL}>
            {guaranteeURL}
          </a>
        </DialogContent>
        <DialogActions>
          <Button color="primary" onClick={props.onClose}>
            Close
          </Button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
