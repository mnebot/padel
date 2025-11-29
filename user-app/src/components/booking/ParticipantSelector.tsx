import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Users, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
}

interface ParticipantSelectorProps {
  currentUserId: string;
  selectedParticipants: string[];
  onParticipantsChange: (participantIds: string[]) => void;
  numberOfPlayers: number;
  availableUsers: User[];
}

export function ParticipantSelector({
  currentUserId,
  selectedParticipants,
  onParticipantsChange,
  numberOfPlayers,
  availableUsers,
}: ParticipantSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter users based on search term
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleUser = (userId: string) => {
    if (selectedParticipants.includes(userId)) {
      // Remove user
      onParticipantsChange(selectedParticipants.filter((id) => id !== userId));
    } else {
      // Add user if not at max capacity
      if (selectedParticipants.length < numberOfPlayers) {
        onParticipantsChange([...selectedParticipants, userId]);
      }
    }
  };

  const isUserSelected = (userId: string) => selectedParticipants.includes(userId);
  const canAddMore = selectedParticipants.length < numberOfPlayers;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Selecciona els participants
        </CardTitle>
        <CardDescription>
          Selecciona {numberOfPlayers} jugador{numberOfPlayers > 1 ? 's' : ''} per a la reserva
          {' '}({selectedParticipants.length}/{numberOfPlayers} seleccionats)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar per nom o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Selected participants */}
        {selectedParticipants.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Participants seleccionats:</p>
            <div className="flex flex-wrap gap-2">
              {selectedParticipants.map((userId) => {
                const user = availableUsers.find((u) => u.id === userId);
                if (!user) return null;
                return (
                  <Badge
                    key={userId}
                    variant="default"
                    className="flex items-center gap-1 pr-1"
                  >
                    {user.name}
                    {userId !== currentUserId && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleToggleUser(userId)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Available users list */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No s'han trobat usuaris
            </p>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = isUserSelected(user.id);
              const isCurrentUser = user.id === currentUserId;
              const isDisabled = !canAddMore && !isSelected;

              return (
                <Button
                  key={user.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'w-full justify-start',
                    isDisabled && 'opacity-50 cursor-not-allowed'
                  )}
                  onClick={() => !isCurrentUser && handleToggleUser(user.id)}
                  disabled={isDisabled || isCurrentUser}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium">
                      {user.name}
                      {isCurrentUser && ' (Tu)'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </Button>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
