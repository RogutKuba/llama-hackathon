import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useCreateCrawler } from '@/query/contextChunk.query';
import { useCurrentSiteId } from '@/lib/pathUtils';

const formSchema = z.object({
  // files: z.array(z.instanceof(File)),
  // rawText: z.string(),
  url: z.string().url(),
});

export const AddContextForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      url: '',
      // rawText: '',
    },
  });

  const { createCrawler } = useCreateCrawler();
  const siteId = useCurrentSiteId();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    await createCrawler({
      siteId,
      ...data,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        {/* <FormField
          control={form.control}
          name='files'
          render={({ field }) => (
            <FormItem>
              <FormDescription>
                <FormLabel>Files</FormLabel>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <FormField
          control={form.control}
          name='url'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Documentation URL</FormLabel>
              <FormDescription>
                Add a link to the documentation to get it automagically parsed.
              </FormDescription>
              <FormControl>
                <Input type='url' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* <FormField
          control={form.control}
          name='rawText'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Raw Text</FormLabel>
              <FormDescription>Add your raw text here</FormDescription>
              <FormControl>
                <Textarea {...field} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        <div className='flex justify-end'>
          <Button type='submit'>Submit</Button>
        </div>
      </form>
    </Form>
  );
};
