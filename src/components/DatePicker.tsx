"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Props {
  placeHolder?: string;
  value?: Date;
  onChange: (date: Date) => void;
}

const DatePicker: React.FC<Props> = ({
  placeHolder = "Select a date",
  value = new Date(),
  onChange,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <div className='flex flex-col gap-3'>
      <Label htmlFor='date' className='px-1'>
        {placeHolder}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            id='date'
            className='w-48 justify-between font-normal'>
            {value ? value.toLocaleDateString() : "Select date"}
            <ChevronDownIcon />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
          <Calendar
            mode='single'
            required
            selected={value}
            captionLayout='dropdown'
            onSelect={onChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DatePicker;
