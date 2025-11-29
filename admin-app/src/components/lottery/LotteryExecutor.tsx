import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Shuffle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ca } from 'date-fns/locale';
import { useLottery } from '@/hooks/useLottery';
import type { LotteryResult } from '@/services/lotteryService';

interface LotteryExecutorProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  timeSlot: string;
  requestCount: number;
  onSuccess: (result: LotteryResult) => void;
}

export function LotteryExecutor({
  isOpen,
  onClose,
  date,
  timeSlot,
  requestCount,
  onSuccess,
}: LotteryExecutorProps) {
  const { executeLottery, isLoading, error } = useLottery();
  const [hasExecuted, setHasExecuted] = useState(false);

  const handleExecute = async () => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const result = await executeLottery(dateStr, timeSlot);
      setHasExecuted(true);
      onSuccess(result);
    } catch (err) {
      // Error is handled by the hook
      console.error('Error executing lottery:', err);
    }
  };

  const handleClose = () => {
    setHasExecuted(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Executar Sorteig
          </DialogTitle>
          <DialogDescription>
            Confirma l'execució del sorteig per a la data i hora seleccionades
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data</p>
              <p className="text-lg font-semibold">
                {format(date, 'd/MM/yyyy', { locale: ca })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Hora</p>
              <p className="text-lg font-semibold">{timeSlot}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Sol·licituds Pendents</p>
            <p className="text-lg font-semibold">{requestCount}</p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {hasExecuted && !error && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Sorteig executat correctament! Consulta els resultats a continuació.
              </AlertDescription>
            </Alert>
          )}

          {!hasExecuted && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Aquesta acció assignarà pistes a les sol·licituds pendents segons el sistema de
                sorteig ponderat. No es pot desfer.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {hasExecuted ? 'Tancar' : 'Cancel·lar'}
          </Button>
          {!hasExecuted && (
            <Button onClick={handleExecute} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner className="mr-2 h-4 w-4" />
                  Executant...
                </>
              ) : (
                <>
                  <Shuffle className="mr-2 h-4 w-4" />
                  Executar Sorteig
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
